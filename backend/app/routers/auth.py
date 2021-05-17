from fastapi.params import Depends
from sqlalchemy.orm.session import Session
from fastapi import APIRouter
from fastapi.exceptions import HTTPException
from starlette import middleware
from starlette.requests import Request
from starlette.responses import JSONResponse, RedirectResponse
from app.depends import get_db
from app.main import oauth
from app.models import User
import secrets
import authlib

router = APIRouter(
    prefix="/auth",
    tags=["Auth Related Endpoints"],
)

@router.get("/")
async def warwick_auth(request: Request):
    redirect_uri = request.url_for("warwick_auth_callback")
    return await oauth.warwick.authorize_redirect(request, redirect_uri)

@router.get("/callback")
async def warwick_auth_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.warwick.authorize_access_token(request)
    except authlib.integrations.base_client.errors.OAuthError:
        return HTTPException(500)

    resp = await oauth.warwick.post("https://websignon.warwick.ac.uk/oauth/authenticate/attributes", token=token)

    if resp is None or resp.status_code != 200:
        return HTTPException(500)
        
    # Extract user's details
    attributes = {}

    for line in resp.text.split("\n"):
        split = line.split("=")
        if len(split) != 2:
            continue
        
        attributes[split[0]] = split[1]

    if attributes.get("warwickcoursecode", None) != "UWMA-H651":
        return HTTPException(403)
    
    warwick_id = int(attributes["id"])

    # Create session token 
    user = db.query(User).get(warwick_id)

    if user is None:
        user = User(warwick_id=warwick_id, firstname=attributes["firstname"], surname=attributes["lastname"], is_admin=warwick_id==1906821)
        db.add(user)
        db.commit()

    session_token = secrets.token_hex(24)
    user.session_token = session_token
    db.commit()

    response = RedirectResponse("http://localhost:3000/challenges")
    response.set_cookie(key="auth", value=session_token)

    return response

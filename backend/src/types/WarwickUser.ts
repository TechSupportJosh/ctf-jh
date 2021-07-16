export interface WarwickUser {
  name: string;
  firstname: string;
  lastname: string;
  id: string;
  warwickcoursecode: string;
  warwickyearofstudy: string;

  [key: string]: string;
}

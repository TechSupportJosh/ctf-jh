"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxTeamMembers = exports.locationFlagPrecision = exports.basePath = void 0;
// The path in which the application is mounted at.
// If your CTF is running with it's own domain/subdomain, this should be /.
// Otherwise, enter the path it is mounted under, including a trailing slash.
// For example, https://techsupportjosh.com/myctf/ -> /myctf/
exports.basePath = "/";
// The precision of the location-style challenges in metres.
exports.locationFlagPrecision = 10;
// The maximum number of members within a team (including the team leader)
exports.maxTeamMembers = 5;

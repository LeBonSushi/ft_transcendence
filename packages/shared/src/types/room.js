"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityCategory = exports.VoteType = exports.MemberRole = exports.RoomStatus = void 0;
var RoomStatus;
(function (RoomStatus) {
    RoomStatus["PLANNING"] = "PLANNING";
    RoomStatus["CONFIRMED"] = "CONFIRMED";
    RoomStatus["COMPLETED"] = "COMPLETED";
})(RoomStatus || (exports.RoomStatus = RoomStatus = {}));
var MemberRole;
(function (MemberRole) {
    MemberRole["ADMIN"] = "ADMIN";
    MemberRole["MEMBER"] = "MEMBER";
})(MemberRole || (exports.MemberRole = MemberRole = {}));
var VoteType;
(function (VoteType) {
    VoteType["YES"] = "YES";
    VoteType["NO"] = "NO";
    VoteType["MAYBE"] = "MAYBE";
})(VoteType || (exports.VoteType = VoteType = {}));
var ActivityCategory;
(function (ActivityCategory) {
    ActivityCategory["RESTAURANT"] = "RESTAURANT";
    ActivityCategory["MUSEUM"] = "MUSEUM";
    ActivityCategory["NIGHTLIFE"] = "NIGHTLIFE";
    ActivityCategory["OUTDOOR"] = "OUTDOOR";
    ActivityCategory["OTHER"] = "OTHER";
})(ActivityCategory || (exports.ActivityCategory = ActivityCategory = {}));

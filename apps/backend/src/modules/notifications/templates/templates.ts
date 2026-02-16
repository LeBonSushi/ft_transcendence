import {CreateNotificationDto, NotificationType} from "@travel-planner/shared"
// Record is like a python dictionnary en javascript
export class NotificationTemplates {
    private static templates: Record<NotificationType, (data: any) => CreateNotificationDto> =
        {
            [NotificationType.TEXT_EXEMPLE]: (data: {
                message: string,
                title: string,
                toUserId:string
            }) => ({
                type: NotificationType.TEXT_EXEMPLE,
                message: data.message,
                title: data.title,
                toUserId:data.toUserId
            }),
            [NotificationType.WELCOME_MSG]: (data: {
                firstName: string,
                toUserId:string
            }) => ({
                type: NotificationType.WELCOME_MSG,
                message: `Hey ${data.firstName},thank you for signing up.`,
                title:  "Welcome!",
                toUserId:data.toUserId

            }),
            [NotificationType.NEW_MESSAGE]: (data: {
                room: string,
                toUserId:string
            }) => ({
                type: NotificationType.NEW_MESSAGE,
                message: `You have a new message from the ${data.room} room.`,
                title: `Room messages`,
                toUserId:data.toUserId
            }),
            [NotificationType.ROOM_INVITE]: (data: {
                username:string,
                toUserId:string
            }) => ({
                type: NotificationType.ROOM_INVITE,
                message: `You have an invitation from ${data.username}.`,
                title: `New invitation`,
                toUserId:data.toUserId
            }),
            [NotificationType.FRIEND_REQUEST]: (data: {
                username : string,
                friendId : string,
                title: string,
                toUserId:string
            }) => ({
                type: NotificationType.FRIEND_REQUEST,
                message: `${data.username} asked you as a friend.`,
                title: 'New friend request',
                friendId : data.friendId,
                toUserId:data.toUserId
            }),
            [NotificationType.ROOM_DELETED]: (data: {
                roomName : string
                toUserId:string
            }) => ({
                type: NotificationType.FRIEND_REQUEST,
                message: `The ${data.roomName} has been deleted.`,
                title: 'Room deleted :(',
                toUserId:data.toUserId
            }),
            [NotificationType.FRIEND_ACCEPTED]: (data: {
                userName : string,
                toUserId:string
            }) => ({
                type: NotificationType.FRIEND_ACCEPTED,
                message: `${data.userName} has accepted your friend request.`,
                title: 'You have a new friend!',
                toUserId:data.toUserId
            })
        }
    static getTemplate(type: NotificationType, data: any): any {
        const notif = this.templates[type]
        return (notif(data))
    }
}


//demande d ami
//invitationn room
//suppression room
//nv message
//message de bienvenue creation compte
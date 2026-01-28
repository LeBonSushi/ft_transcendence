import { NotificationType } from "@prisma/client"
import { NotificationModel } from "./type"

// Record is like a python dictionnary en javascript
export class NotificationTemplates {
    private static templates: Record<NotificationType, (data: any) => NotificationModel> =
        {
            [NotificationType.TEXT_EXEMPLE]: (data: {
                message: string,
                title: string
            }) => ({
                type: NotificationType.TEXT_EXEMPLE,
                message: data.message,
                title: data.title
            }),
            [NotificationType.WELCOME_MSG]: (data: {
                firstName: string
            }) => ({
                type: NotificationType.WELCOME_MSG,
                message: `Hey ${data.firstName},thank you for signing up.`,
                title:  "Welcome!"

            }),
            [NotificationType.NEW_MESSAGE]: (data: {
                room: string
            }) => ({
                type: NotificationType.NEW_MESSAGE,
                message: `You have a new message from the ${data.room} room.`,
                title: `Room messages`
            }),
            [NotificationType.ROOM_INVITE]: (data: {
                username:string
            }) => ({
                type: NotificationType.ROOM_INVITE,
                message: `You have an invitation from ${data.username}.`,
                title: `New invitation`
            }),
            [NotificationType.FRIEND_REQUEST]: (data: {
                username : string
                title: string
            }) => ({
                type: NotificationType.FRIEND_REQUEST,
                message: `${data.username} asked you as a friend.`,
                title: 'New friend request'
            }),
            [NotificationType.ROOM_DELETED]: (data: {
                roomName : string
            }) => ({
                type: NotificationType.FRIEND_REQUEST,
                message: `The ${data.roomName} has been deleted.`,
                title: 'Room deleted :('
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
import { NotificationType } from "@prisma/client"
import { NotificationModel } from "./type"

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
                message: `Hey ${data.firstName},thank you for signing up `,
                title:  "Welcome!"

            }),
            [NotificationType.NEW_MESSAGE]: (data: {
                message: string,
                title: string
            }) => ({
                type: NotificationType.NEW_MESSAGE,
                message: data.message,
                title: data.title
            }),
            [NotificationType.ROOM_INVITE]: (data: {
                message: string,
                title: string
            }) => ({
                type: NotificationType.ROOM_INVITE,
                message: data.message,
                title: data.title
            }),
            [NotificationType.FRIEND_REQUEST]: (data: {
                message: string,
                title: string
            }) => ({
                type: NotificationType.FRIEND_REQUEST,
                message: data.message,
                title: data.title
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
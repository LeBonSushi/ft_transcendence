import { NotificationType } from "@prisma/client"
import { NotificationModel } from "./type"

export class NotificationTemplates {
    private static templates: Record<NotificationType, (data: any) =>NotificationModel> =
        {
            [NotificationType.TEXT_EXEMPLE]: (data: {
                message: string,
                title:string
            }) => ({
                type: NotificationType.TEXT_EXEMPLE,
                message: data.message,
                title: data.title
            })
        }
    static getTemplate(type: NotificationType, data: any): any {
        const notif = this.templates[type]
        return (notif(data))
    }
}

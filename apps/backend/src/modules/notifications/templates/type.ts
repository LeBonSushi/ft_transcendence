import { NotificationType  } from "@prisma/client";

export interface NotificationModel {
    message:string,
    title:string,
    type :NotificationType,
    friendId? :string,
    roomId?: string
}
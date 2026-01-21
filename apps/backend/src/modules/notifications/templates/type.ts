import { NotificationType  } from "@prisma/client";

export interface NotificationTemplate {
    message:string,
    title:string,
    type :NotificationType,
}
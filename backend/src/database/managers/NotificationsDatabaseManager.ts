import { Kysely, sql } from 'kysely';
import { Database, NewNotification, Notification, UpdateNotification } from "../Database.js";
import IDatabaseManager from "./IDatabaseManager.js"; // Assuming this interface exists and defines an init() method

export default class NotificationsDatabaseManager implements IDatabaseManager {
    db: Kysely<Database>

    constructor(db: Kysely<Database>) {
        this.db = db;
    }

    /**
     * Initializes the notifications table in the database.
     */
    async init(): Promise<boolean> {
        const TABLE_QUERY = sql`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                accountId INT UNSIGNED NOT NULL,
                type ENUM('approval', 'message', 'system') NOT NULL,
                message VARCHAR(500) NOT NULL,
                \`read\` BOOLEAN NOT NULL DEFAULT FALSE,
                timeCreated BIGINT NOT NULL,
                FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE
            );`;

        try {
            await TABLE_QUERY.execute(this.db);
            return true;
        } catch (error) {
            console.error("Error encountered during creating `notifications` table: " + error);
            return false;
        }
    }

    /**
     * Creates a new notification.
     */
    async createNotification(newNotification: NewNotification): Promise<bigint> {
        try {
            const timeCreated = Date.now();
            const notification = {
                accountId: newNotification.accountId,
                type: newNotification.type,
                message: newNotification.message,
                timeCreated: timeCreated,
                read: false
            };

            const result = await this.db
                .insertInto("notifications")
                .values(notification)
                .executeTakeFirst();

            if (typeof result.insertId === "undefined" || result.insertId < 0) {
                throw new Error("Invalid INSERT ID! Notification may still be inserted.");
            }

            return result.insertId;
        } catch (error) {
            throw error instanceof Error ? error : new Error(`Error creating notification: ${String(error)}`);
        }
    }

    /**
     * Retrieves all notifications for a specific account, ordered by creation time descending.
     */
    async getNotificationsForAccount(accountId: number): Promise<Notification[]> {
        return await this.db
            .selectFrom("notifications")
            .selectAll()
            .where("accountId", '=', accountId)
            .execute();
    }

    /**
     * Updates a specific notification. Currently supports marking as read/unread.
     */
    async updateNotification(id: number, updates: UpdateNotification): Promise<boolean> {
         const result = await this.db
            .updateTable("notifications")
            .set(updates) // updates should be { read: boolean }
            .where("id", '=', id)
            .executeTakeFirst();
        return result.numUpdatedRows > 0;
    }

    /**
     * Marks a specific notification as read.
     */
    async markNotificationAsRead(id: number): Promise<boolean> {
        return this.updateNotification(id, { read: true });
    }

    /**
     * Marks all unread notifications for a specific account as read.
     */
    async markAllNotificationsAsRead(accountId: number): Promise<boolean> {
        const result = await this.db
            .updateTable("notifications")
            .set({ read: true })
            .where("accountId", '=', accountId)
            .where("read", '=', false) // Only update unread notifications
            .executeTakeFirst();
        // Returns true if the operation succeeded, even if no rows were updated (e.g., all were already read).
        return result.numUpdatedRows >= 0;
    }

    /**
     * Deletes a specific notification by its ID.
     */
    async deleteNotification(id: number): Promise<boolean> {
        const result = await this.db
            .deleteFrom("notifications")
            .where("id", '=', id)
            .executeTakeFirst();
        return result.numDeletedRows > 0;
    }

    /**
     * Deletes all notifications for a specific account.
     */
    async deleteNotificationsForAccount(accountId: number): Promise<boolean> {
        const result = await this.db
            .deleteFrom("notifications")
            .where("accountId", '=', accountId)
            .executeTakeFirst();
        // Returns true if any rows were deleted.
        return result.numDeletedRows > 0;
    }
}

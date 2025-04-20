import { sql } from 'kysely';
export default class NotificationsDatabaseManager {
    db;
    constructor(db) {
        this.db = db;
    }
    /**
     * Initializes the notifications table in the database.
     */
    async init() {
        const TABLE_QUERY = sql `
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
        }
        catch (error) {
            console.error("Error encountered during creating `notifications` table: " + error);
            return false;
        }
    }
    /**
     * Creates a new notification.
     */
    async createNotification(newNotification) {
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
        }
        catch (error) {
            throw error instanceof Error ? error : new Error(`Error creating notification: ${String(error)}`);
        }
    }
    /**
     * Retrieves all notifications for a specific account, ordered by creation time descending.
     */
    async getNotificationsForAccount(accountId) {
        return await this.db
            .selectFrom("notifications")
            .selectAll()
            .where("accountId", '=', accountId)
            .orderBy("timeCreated", "desc")
            .execute();
    }
    /**
     * Updates a specific notification. Currently supports marking as read/unread.
     */
    async updateNotification(id, updates) {
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
    async markNotificationAsRead(id) {
        return this.updateNotification(id, { read: true });
    }
    /**
     * Marks all unread notifications for a specific account as read.
     */
    async markAllNotificationsAsRead(accountId) {
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
    async deleteNotification(id) {
        const result = await this.db
            .deleteFrom("notifications")
            .where("id", '=', id)
            .executeTakeFirst();
        return result.numDeletedRows > 0;
    }
    /**
     * Deletes all notifications for a specific account.
     */
    async deleteNotificationsForAccount(accountId) {
        const result = await this.db
            .deleteFrom("notifications")
            .where("accountId", '=', accountId)
            .executeTakeFirst();
        // Returns true if any rows were deleted.
        return result.numDeletedRows > 0;
    }
}

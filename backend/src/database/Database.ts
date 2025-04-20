import {
    ColumnType,
    Generated,
    Insertable,
    Selectable,
    Updateable,
} from "kysely"

export interface Database {
    accounts: AccountsTable
    loans: LoansTable
    notifications: NotificationsTable
}

// ====================
//      Accounts
// ====================

interface VerifiedAccount {
    verified: boolean
}

interface BaseAccountInterface {
    username: string,
    password: string,
    salt: string,
    displayName: string,
    country: string,
    ip: string,
}

interface AccountsTable extends BaseAccountInterface {
    id: Generated<number>
    pfp: string|null
    loaned: string
    loans: string
    toApprove: string
    timeCreated: ColumnType<Date, number, never>
    verified: boolean,
    idVerificationNumber: string|null
}

export type Account = Selectable<AccountsTable>
export type NewAccount = Insertable<BaseAccountInterface> // Use Base for insertion, ID is generated
export type UpdateAccount = Updateable<VerifiedAccount> // Allow updating any selectable field except ID

// ====================
//        Loans
// ====================

interface LoanPaid {
    paid: boolean
}

interface BaseLoanInterface {
    loanedId: number 
    loanerId: number
    amount: number 
    currency: string
    timeExpires: ColumnType<Date, bigint, never>
}

interface LoansTable extends BaseLoanInterface {
    id: Generated<number>
    proofs: string,
    paid: boolean
    timeCreated: ColumnType<Date, number, never> 
    approved: boolean
}

export type Loan = Selectable<LoansTable>
export type NewLoan = Insertable<BaseLoanInterface> // Use Base for insertion, ID is generated
export type UpdateLoan = Updateable<LoanPaid> // Allow updating any selectable field except ID and accountId

// ====================
//     Notifications
// ====================

interface BaseNotificationInterface {
    accountId: number
    type: 'approval' | 'message' | 'system'
    message: string   
    link: string|null
}

interface NotificationsTable extends BaseNotificationInterface {
    id: Generated<number>
    read: boolean
    timeCreated: ColumnType<Date, number, never>
}

export type Notification = Selectable<NotificationsTable>
export type NewNotification = Insertable<BaseNotificationInterface>
export type UpdateNotification = Updateable<{ read: boolean }>

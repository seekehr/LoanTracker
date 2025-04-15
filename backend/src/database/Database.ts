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
    loans: string
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
    timeExpires: ColumnType<Date, number, never>
}

interface LoansTable extends BaseLoanInterface {
    id: Generated<number>
    proofs: string,
    paid: boolean
    timeCreated: ColumnType<Date, number, never> 
}

export type Loan = Selectable<LoansTable>
export type NewLoan = Insertable<BaseLoanInterface> // Use Base for insertion, ID is generated
export type UpdateLoan = Updateable<LoanPaid> // Allow updating any selectable field except ID and accountId

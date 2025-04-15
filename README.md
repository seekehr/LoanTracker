# API

## Database
Account: {id, username (unique), display name, password, some kind of ID verification number, country, ip, loans, time created, verified}
Loan: {id, expiryDate, dateCreated, loanedId, loaneeId, paid}

## Routes

### Middleares:
auth.ts
ratelimiter.ts

#### Login:

/register - POST
**Headers: display name, username, password**
/login - POST
**Headers: username, password**
/check-username - POST
**Params: username**

#### User:

/profile - GET
**Cookies: token**
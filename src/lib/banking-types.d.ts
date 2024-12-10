declare module "banking" {
  /**
   * Represents a bank account type
   */
  export type AccountType = "checking" | "savings" | "investment";

  /**
   * Represents a transaction in the banking system
   */
  export interface Transaction {
    id: string;
    amount: number;
    date: Date;
    description: string;
    type: "deposit" | "withdrawal" | "transfer";
    status: "pending" | "completed" | "failed";
  }

  /**
   * Represents a bank account
   */
  export interface Account {
    id: string;
    type: AccountType;
    balance: number;
    currency: string;
    owner: string;
    transactions: Transaction[];
  }

  /**
   * Main Banking class for handling financial operations
   */
  export class Banking {
    /**
     * Creates a new Banking instance
     * @param apiKey - The API key for authentication
     */
    constructor(apiKey: string);

    /**
     * Creates a new account
     * @param type - The type of account to create
     * @param owner - The name of the account owner
     * @param initialDeposit - Optional initial deposit amount
     */
    createAccount(
      type: AccountType,
      owner: string,
      initialDeposit?: number
    ): Promise<Account>;

    /**
     * Retrieves an account by its ID
     * @param accountId - The account ID to look up
     */
    getAccount(accountId: string): Promise<Account>;

    /**
     * Performs a deposit transaction
     * @param accountId - The account to deposit to
     * @param amount - The amount to deposit
     * @param description - Optional transaction description
     */
    deposit(
      accountId: string,
      amount: number,
      description?: string
    ): Promise<Transaction>;

    /**
     * Performs a withdrawal transaction
     * @param accountId - The account to withdraw from
     * @param amount - The amount to withdraw
     * @param description - Optional transaction description
     */
    withdraw(
      accountId: string,
      amount: number,
      description?: string
    ): Promise<Transaction>;

    /**
     * Transfers money between accounts
     * @param fromAccountId - The source account
     * @param toAccountId - The destination account
     * @param amount - The amount to transfer
     * @param description - Optional transaction description
     */
    transfer(
      fromAccountId: string,
      toAccountId: string,
      amount: number,
      description?: string
    ): Promise<Transaction>;

    /**
     * Gets the transaction history for an account
     * @param accountId - The account to get history for
     * @param limit - Optional limit of transactions to return
     */
    getTransactionHistory(
      accountId: string,
      limit?: number
    ): Promise<Transaction[]>;
  }
}

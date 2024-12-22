/*class CosmosDBError extends Error {
    constructor(
      message: string,
      public statusCode: number,
      public code?: string
    ) {
      super(message);
      this.name = 'CosmosDBError';
    }
}
*/
export interface CosmosError {
    code: number;
    message: string;
    [key: string]: unknown; // 他のプロパティも許容するため
}
/*
export const handleCosmosError = (error: CosmosError) => {
    if (error.code === 409) {
      return new CosmosDBError(
        'Document already exists',
        409,
        'DOCUMENT_EXISTS'
      );
    }
    if (error.code === 404) {
      return new CosmosDBError(
        'Document not found',
        404,
        'DOCUMENT_NOT_FOUND'
      );
    }
    return new CosmosDBError(
      'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  };
*/
  export function handleCosmosError(error: unknown): void {
    if (isCosmosError(error)) {
        // CosmosErrorとして処理
        console.error(`Error Code: ${error.code}, Message: ${error.message}`);
    } else {
        // 一般的なエラーハンドリング
        console.error('Unknown Error', error);
    }
}

function isCosmosError(error: unknown): error is CosmosError {
    return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
}
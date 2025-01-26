declare global {
    namespace NodeJS {
      interface ProcessEnv {
        PORT: string,
        environment: string
      }
    }
  }
  
  export {};
  
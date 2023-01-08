declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_TOKEN: string;
      DATABASE_URL: string;
      TWITTER_TOKEN: string;
    }
  }
}

export {};

import { UTApi } from "uploadthing/server";

class UTApiInstance {
  private static instance: UTApiInstance;
  private utapi: UTApi;

  private constructor() {
    this.utapi = new UTApi({ logLevel: "All" });
  }

  public static getInstance(): UTApiInstance {
    if (!UTApiInstance.instance) {
      UTApiInstance.instance = new UTApiInstance();
    }
    return UTApiInstance.instance;
  }

  public getUTApi(): UTApi {
    return this.utapi;
  }
}

export const utapi: UTApi = UTApiInstance.getInstance().getUTApi();

export class Service {
  private static instance: Service;

  public static get Instance() {
    if (!Service.instance) Service.instance = new Service();

    return Service.instance;
  }
}

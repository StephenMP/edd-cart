export abstract class EventBase {
  public toString(): string {
    return JSON.stringify(this);
  }
}

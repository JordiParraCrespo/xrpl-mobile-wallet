export class UserRegisteredEvent {
  static readonly eventName = 'user.registered';

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly firstName: string,
  ) {}
}

export interface Subscriber {
  name: string;
  callback: (data: any) => void;
}

class EventBus {
  private static instance: EventBus | undefined;
  private subscribers: Map<string, Array<Subscriber>>;

  constructor() {
    this.subscribers = new Map();
  }

  public static getInstance() {
    if (EventBus.instance === undefined) {
      EventBus.instance = new EventBus();
    }

    return EventBus.instance;
  }

  public async publish(topicName: string, data: any) {
    let subscribers = this.subscribers.get(topicName);
    console.log(subscribers);

    subscribers!.forEach((s) => s.callback(data));
  }

  public async subscribe(topicName: string, subscriber: Subscriber) {
    if (!this.subscribers.has(topicName)) {
      this.subscribers.set(topicName, []);
    }

    let subscriberList = this.subscribers.get(topicName);
    subscriberList!.push(subscriber);
  }

  public async remove(topicName: string, subscriberName: string) {
    let subscriberList = this.subscribers.get(topicName)!;
    this.subscribers.set(
      topicName,
      subscriberList.filter((s) => s.name !== subscriberName)
    );
  }
}

export default EventBus;

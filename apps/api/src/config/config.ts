export interface Configuration {
  kafka: {
    brokers: string[];
  };
}

export const configuration = (): Configuration => ({
  kafka: {
    brokers: process.env.KAFKA_BROKERS.split(','),
  },
});

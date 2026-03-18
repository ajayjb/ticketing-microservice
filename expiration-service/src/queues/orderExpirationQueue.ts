import { Job, Queue, Worker, WorkerOptions } from "bullmq";

import { QUEUES } from "@/constants/queue";
import { queueRedisOptionsType } from "@/types/redis";
import { natsWrapper } from "@/services/nats.service";
import { OrderExpirationCompletionPublisher } from "@/events/publishers/orderExpirationCompletionPublisher";
import { sanitizedConfig } from "@/config/config";

class OrderExpirationQueue {
  private redisOptions: queueRedisOptionsType;
  public queue: Queue;

  constructor() {
    this.redisOptions = {
      host: sanitizedConfig.REDIS_HOST,
      port: sanitizedConfig.REDIS_PORT,
    };

    this.queue = new Queue(QUEUES.ORDER_PROCESSING, {
      connection: this.redisOptions,
    });

    const workerOptions = {
      connection: this.redisOptions,
      concurrency: 1,
    };

    this.createWorker(workerOptions);
  }

  private createWorker(options: WorkerOptions) {
    const worker = new Worker(
      QUEUES.ORDER_PROCESSING,
      this.processOrderExpiration,
      options
    );

    worker.on("completed", (job) => {
      console.log(`✅ Job completed: ${job.id}`);
    });

    worker.on("failed", (job, err) => {
      console.error(`❌ Job failed: ${job?.id}`, err);
    });
  }

  private processOrderExpiration = async (job: Job): Promise<void> => {
    const { orderId } = job.data;
    console.log(`⏳ Processing expiration for order: ${orderId}`);

    new OrderExpirationCompletionPublisher(natsWrapper.client).publish({
      orderId,
    });
  };
}

const orderExpirationQueue = new OrderExpirationQueue().queue;

export { orderExpirationQueue };

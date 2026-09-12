import json
from rabbitmq import connect_rabbitmq, get_channel
from predictor import Predictor


predictor = Predictor()


def callback(ch, method, properties, body):

    data = json.loads(body)

    print("\nReceived:", data)

    result = predictor.predict(data)

    print("Prediction result:", result)

    ch.basic_publish(
        exchange='',
        routing_key='prediction_result_queue',
        body=json.dumps(result)
    )

    ch.basic_ack(delivery_tag=method.delivery_tag)


def start():

    connect_rabbitmq()
    channel = get_channel()

    channel.basic_consume(
        queue='prediction_queue',
        on_message_callback=callback
    )

    print("Consumer running...")
    channel.start_consuming()


if __name__ == "__main__":
    start()
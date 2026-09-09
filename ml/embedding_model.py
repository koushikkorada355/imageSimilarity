import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from tensorflow.keras.layers import GlobalMaxPooling2D
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from numpy.linalg import norm

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
tf.get_logger().setLevel('ERROR')

model = None


def load_model():
    global model
    if model is not None:
        return model
    
    base_model = ResNet50(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    base_model.trainable = False
    
    model = tf.keras.Sequential([
        base_model,
        GlobalMaxPooling2D()
    ])
    
    return model


def extract_embedding(image_path):
    model_instance = load_model()
    
    img = load_img(image_path, target_size=(224, 224), color_mode='rgb')
    img_array = img_to_array(img)
    expanded = np.expand_dims(img_array, axis=0)
    preprocessed = preprocess_input(expanded)
    
    embedding = model_instance.predict(preprocessed, verbose=0).flatten()
    normalized = embedding / norm(embedding)
    
    return normalized.tolist()

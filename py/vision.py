import tensorflow as tf

gpu_devices = tf.config.experimental.list_physical_devices("GPU")
if any(gpu_devices):
    tf.config.experimental.set_memory_growth(gpu_devices[0], True)

from doctr.models import ocr_predictor

predictor = ocr_predictor(pretrained=True)
det_predictor = predictor.det_predictor
reco_predictor = predictor.reco_predictor

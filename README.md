
# Conductor ML

![Conductor](./assets/conductor.png 'Conductor Image')

The hall falls silent.
As the curtains gently part, you step onto the podium—every eye in the room fixed on you. You bow before the audience, a gesture of grace and tradition.
Before you, the orchestra waits, poised in perfect stillness, ready to follow your lead.
With a single motion, your hand rises—and the music begins to breathe through your gestures.

With ConductorML, the baton is in your hands.
Command your own digital orchestra, where every section listens for your cue.
Using two Arduino Nano 33 boards, your gestures shape the music—guiding instruments, adjusting volume, and sculpting the dynamics in real time.
All of it unfolds through a custom-built web interface, where each instrument section is brought to life before your eyes.

## Table of Contents
1. [Team](#team)
2. [Idea](#idea)
3. [Overview](#overview)
4. [Setup](#setup)

## Team

This project was developed as part of the TinyML course led by [Prof. Cristian Axenie](https://www.th-nuernberg.de/person/axenie-cristian/) at the Georg Simon Ohm University of Applied Sciences Nuremberg during the summer semester of 2025.
The team behind ConductorML consists of
- Eleonora Schubert, 3296062, schubertel75720@th-nuernberg.de
- Kristoph Kolert, 3128311, kolertkr103269@th-nuernberg.de
- Tan Phat Nguyen, 3818565, nguyenta100556@th-nuernberg.de
- Robin Feldmann, 3538270, feldmannro80685@th-nuernberg.de, 

united by a shared passion for music, technology, and creative experimentation.

## Idea

The core idea behind ConductorML is to use the onboard IMU (accelerometer and gyroscope) of the Arduino Nano 33 BLE to recognize hand gestures performed by the user.
The project draws inspiration from and builds upon the [Magic Wand](https://github.com/petewarden/magic_wand) repository by Peter Warden.

Instead of using raw accelerometer and gyroscope data directly for gesture classification, the system estimates the device’s orientation by integrating gyroscope data over time. It then tracks changes in orientation to approximate gesture movement. Using recent motion history, a 2D stroke representation of the gesture is extracted and rasterized into an image.

These 2D images are then classified into gesture categories by a small convolutional neural network, implemented using TensorFlow Lite for Microcontrollers. The model runs directly on the Arduino Nano 33 BLE’s onboard neural processing unit, enabling efficient, real-time inference on embedded hardware.
The classification result is transmitted to a central computer and displayed in a custom-built web interface. This interface not only visualizes the recognized gestures but also maps them to playback triggers and volume changes for different sections of the digital orchestra—enabling intuitive, real-time control through gesture alone.

## Overview

The following sections are organized to provide a clear overview of all the moving parts that make up our application:

1. [Models](#models)

    This section explains how our gesture classification models were developed—from the initial data collection and preprocessing steps to model architecture and training. It provides insight into the process of transforming raw IMU data into effective, deployable models.

2.  [Arduino Sketch](#arduino)

    Here we detail how the trained models are deployed on the Arduino Nano 33 BLE using TensorFlow Lite for Microcontrollers. You'll find information on real-time inference, onboard data preprocessing, and the Bluetooth communication setup used to transmit predictions and stroke data.

3.  [Frontend](#frontend)

    This part covers the code powering the web interface that brings everything together. It receives gesture classifications and stroke data via Bluetooth, maps them to musical actions, and controls both the audio playback and visual feedback of the digital orchestra.

## Models

Two Arduino Nano 33 BLE boards are used—one for each hand—with slightly different gesture sets. One device is responsible for instrument selection, while the other controls commands sent to the selected instrument (e.g., play, stop, volume).
The code is organized so that all model-related logic can be found in the following directories:

- [python_instrument](./python_instrument) – for the instrument-selection model

- [python_command ](./python_command)– for the command/execution model


### 1. Data Collection

Data was collected using a general procedure where both Arduinos were connected via Bluetooth. Gestures were recorded using either a simple web interface or a basic Python application [to do add to repo and link here to src folder], both designed to log stroke data for training.
Each recorded stroke consists of a sequence of points that define a gesture path, captured in normalized coordinates ranging from -1 to +1. These are later scaled and rasterized into image representations for training.

The stroke data is saved as a JSON and has the following structure:
```python
class StrokePoint:
    """Represents a single point in a gesture stroke.
    Coordinates are normalized in the range [-1, 1] and must be scaled to match the resolution of the output 2D image.
    """
    x: float
    y: float

class Stroke:
    """Represents a single gesture stroke.
    The label is an integer corresponding to a specific gesture class,
    with the exact meaning depending on whether the stroke was recorded from the left or right device.
    """
    index: int
    strokePoints: list[StrokePoint]
    label: int

class StrokeData:
    strokes: List[Stroke]
``` 

The data for the [instrument-selection model is available here](./python_instrument/data), and the data for the [command-control model can be found here](./python_command/data).

The following example shows how raw gyroscope data is transformed during preprocessing.
This entire procedure—including orientation estimation and stroke rendering—is already performed on the Arduino, enabling efficient real-time gesture classification on-device.

Raw normalized data, recorded directly from the gyroscope:

![Raw Gyro Data Circle](./assets/circle_sample.png)

Processed stroke image, after estimating device orientation through integration and rendering the gesture path as a 64×64 raster image:

![Transformed 64x64 Image](./assets/circle_stroke.png)


### 2. Preprocessing and Data Augmentation

The full data pipeline—from loading and preprocessing to training—is documented in the following Jupyter notebooks:

- [Instrument Notebook](./python_instrument/train.ipynb)

- [Command Notebook](./python_command/train.ipynb)

Each notebook includes data loading, stroke rasterization, augmentation, model definition, training, and export to TensorFlow Lite format for deployment on the Arduino.


## Arduino 

## Frontend

![Conductor Web Interface](./preview.png 'Conductor Web Interface')


## Setup



### Technologies

- **Frontend:** Nuxt Framework
- **Hardware:** Arduino Nano 33 BLE Sense
- **Communication:** Bluetooth Low Energy (BLE)
- **Machine Learning:** TensorFlow (for model training)

### Getting Started

#### Prerequisites

Ensure the following are installed:

- [Node.js](https://nodejs.org/)
- [PNPM](https://pnpm.io/installation)
- [Arduino IDE](https://www.arduino.cc/en/software)
- [Python 3.12](https://www.python.org/downloads/)

#### Development Setup

**1. Clone the Repository:**

```bash
git clone https://github.com/TinyML-TH-Ohm/conductor.git
cd conductor
```

**2. Web Application Setup:**

Navigate to the project's root directory and execute:

```bash
pnpm install
pnpm dev
```

The web application will be accessible at [http://localhost:3000](http://localhost:3000).

**3. Arduino Setup:**

Connect your Arduino Nano 33 BLE Sense via USB.

Open the Arduino sketches located in [/arduino-instrument](/arduino-instrument) and [/arduino-command](/arduino-command) using the Arduino IDE.

Install the required Arduino libraries:

- [ArduinoBLE](https://docs.arduino.cc/libraries/arduinoble/) (via Library Manager)
- [Arduino_LSM9DS1](https://github.com/arduino-libraries/Arduino_LSM9DS1) (via Library Manager)
- [tflite-micro-arduino.zip](/tflite-micro-arduino.zip) (Add via `Sketch > Include Library > Add Zip Library`)

Upload the sketch to your Arduino board.

**4. Python Setup:**

Create and activate a virtual environment:

```bash
python -m venv .venv
# On Linux/macOS:
source ./.venv/bin/activate
# On Windows:
.\.venv\Scripts\activate.bat
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Jupyter notebooks for model training are available in [/python_instrument](/python_instrument) and [/python_command](/python_command).

## Credit

- [TensorFlow Lite Micro Library for Arduino](https://github.com/tensorflow/tflite-micro-arduino-examples#how-to-install)

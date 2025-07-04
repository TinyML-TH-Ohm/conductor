
# Conductor ML

![Conductor](./conductor.png 'Conductor Image')

The hall falls silent.
As the curtains gently part, you step onto the podium—every eye in the room fixed on you. You bow before the audience, a gesture of grace and tradition.
Before you, the orchestra waits, poised in perfect stillness, ready to follow your lead.
With a single motion, your hand rises—and the music begins to breathe through your gestures.

With ConductorML, the baton is in your hands.
Command your own digital orchestra, where every section listens for your cue.
Using two Arduino Nano 33 boards, your gestures shape the music—guiding instruments, adjusting volume, and sculpting the dynamics in real time.
All of it unfolds through a custom-built web interface, where each instrument section is brought to life before your eyes.

## Team

This project was developed as part of the TinyML course led by [Prof. Cristian Axenie](https://www.th-nuernberg.de/person/axenie-cristian/) at the Georg Simon Ohm University of Applied Sciences Nuremberg during the summer semester of 2025.
The team behind ConductorML consists of Chris, Elli, Phat, and Robin (Volle Namen und Matrikelnummer hier noch?)— united by a shared passion for music, technology, and creative experimentation.

## Idea

The core idea behind ConductorML is to use the onboard IMU (accelerometer and gyroscope) of the Arduino Nano 33 BLE to recognize hand gestures performed by the user.
The project draws inspiration from and builds upon the [Magic Wand](https://github.com/petewarden/magic_wand) repository by Peter Warden.

Instead of using raw accelerometer and gyroscope data directly for gesture classification, the system estimates the device’s orientation by integrating gyroscope data over time. It then tracks changes in orientation to approximate gesture movement. Using recent motion history, a 2D stroke representation of the gesture is extracted and rasterized into an image.

These 2D images are then classified into gesture categories by a small convolutional neural network, implemented using TensorFlow Lite for Microcontrollers. The model runs directly on the Arduino Nano 33 BLE’s onboard neural processing unit, enabling efficient, real-time inference on embedded hardware.
The classification result is transmitted to a central computer and displayed in a custom-built web interface. This interface not only visualizes the recognized gestures but also maps them to playback triggers and volume changes for different sections of the digital orchestra—enabling intuitive, real-time control through gesture alone.


# Conductor

Conductor is a web application enabling users to control sound parameters via gestures detected by an Arduino Nano 33 BLE Sense. It utilizes Bluetooth Low Energy (BLE) for wireless communication between the Arduino and the web interface, providing an intuitive sound control experience for future conductors.

![Conductor Web Interface](./preview.png 'Conductor Web Interface')

## Features

- Gesture-based sound parameter control using an Arduino Nano 33 BLE Sense.
- Web-based interface for sound interaction.
- Wireless communication via Bluetooth Low Energy (BLE).

## Technologies

- **Frontend:** Nuxt Framework
- **Hardware:** Arduino Nano 33 BLE Sense
- **Communication:** Bluetooth Low Energy (BLE)
- **Machine Learning:** TensorFlow (for model training)

## Getting Started

### Prerequisites

Ensure the following are installed:

- [Node.js](https://nodejs.org/)
- [PNPM](https://pnpm.io/installation)
- [Arduino IDE](https://www.arduino.cc/en/software)
- [Python 3.12](https://www.python.org/downloads/)

### Development Setup

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

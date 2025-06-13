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

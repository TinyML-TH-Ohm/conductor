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

## Gesture Data Collection
Gesture data collection is based on [Pete Warden's Magic Wand Example](https://github.com/petewarden/magic_wand). An Arduino Nano 33 BLE Sense was flashed with the magic_wand sketch.
### Data Recording Process
- For each gesture, 100 samples were recorded using the built-in data collection website included in the repository.
- Recorded samples were labeled according to the expected input used in the frontend.
- The labeled data was saved into:
  - ./python_command/data/
  - ./python_instrument/data/
### Model Training
- Once data was collected, the respective training notebooks were executed:
  - ./python_command/train.ipynb
  - ./python_instrument/train.ipynb
- These notebooks generated model.cc files, which were then placed in:
  - ./arduino_command/
  - ./arduino_instrument/
### Adding or Removing Gestures
To add or remove gestures, the following changes must be made alongside the removal or addition of .json data files in the respective data folders:
#### Arduino Sketches
For ./arduino_command/arduino_command.ino and ./arduino_instrument/arduino_instrument.ino:
- const int label_count = X; // Set X to number of gestures
- const char* labels[] = {"0", "1", ...}; // List all gesture labels
#### Training Notebooks
For ./python_command/train.ipynb and ./python_instrument/train.ipynb:
- LABELS = ["0", "1", ...]  # Must match Arduino labels

## Credit

- [TensorFlow Lite Micro Library for Arduino](https://github.com/tensorflow/tflite-micro-arduino-examples#how-to-install)
- [Pete Warden's Magic Wand Example](https://github.com/petewarden/magic_wand)

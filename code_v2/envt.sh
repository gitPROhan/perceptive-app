# sets up the virtual environment in backend folder

cd ./backend


python3 -m venv environmentname
source environmentname/bin/activate

pip install Flask
pip install pymongo
pip3 install numpy
pip install opencv-python
pip install Pillow
pip install sk-video
pip install matplotlib
pip install --no-cache-dir torchvision
pip install yacs
pip3 install -U scikit-learn scipy matplotlib
pip install scikit-image
pip install Flask-Cors

# if running on ubuntu use this command:
sudo apt-get install python3-opencv

# if running on mac, use this command:
# brew install opencv

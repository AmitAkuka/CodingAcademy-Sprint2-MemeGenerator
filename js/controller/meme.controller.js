'use strict';

console.log('Meme controller Working!');

let gElCanvas = document.querySelector('#canvas');
let gCtx = gElCanvas.getContext('2d');

function renderMeme() {
    const { selectedImgId, lines, stickers } = getgMeme();
    //return when resize calling func
    let img = new Image();
    img.src = `../../images/${selectedImgId}.jpg`
    img.onload = () => {
        //Draw Image
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
        if (stickers.length) renderStickers(stickers);
        //Draw Text;
        //Styles:
        lines.forEach((line, idx) => {
            gCtx.font = `${line.size}px ${line.fontFamily}`;
            gCtx.textAlign = line.align;
            gCtx.fillStyle = line.color;
            gCtx.strokeStyle = line.strokeColor;
            let x = gElCanvas.width / 2;
            let y;
            if (idx === 0) {
                //first line at the top
                y = 50 + line.newPosition;
            } else if (idx === 1) {
                //second line at the bottom.
                y = gElCanvas.height - 25 + line.newPosition;
            } else {
                //third line at the middle.
                y = gElCanvas.height / 2 + line.newPosition;
            }
            //text width = fullwidth - 20.
            gCtx.fillText(line.txt, x, y, gElCanvas.width - 20);
            //stroke
            gCtx.strokeText(line.txt, x, y, gElCanvas.width - 20);
        })
    };
}

function renderStickers(stickers) {
    stickers.forEach((sticker) => {
        let stickerImg = new Image();
        stickerImg.src = `../../images/stickers/${sticker.id}.png`
            //Draw Sticker
        gCtx.drawImage(stickerImg, gElCanvas.width - 250, 50, 150, 100 / 2);
    })
}

function onSavedNavClick(elSavedNav) {
    elSavedNav.classList.add('active');
    document.querySelector('.gallery-nav-btn').classList.remove('active');
    document.querySelector('.editor-container').style.display = 'none';
    document.querySelector('.gallery-container').style.display = 'none';
    document.querySelector('.saved-memes-container').style.display = 'flex';
    let savedMemes = getSavedMemes();
    if (!savedMemes.length) {
        document.querySelector('.saved-memes-gallery h1').style.display = 'block';
        return;
    }
    let strHTML = savedMemes.map((savedMeme) => {
        return `<img src="${savedMeme}">`;
    })
    document.querySelector('.saved-memes-gallery').innerHTML = strHTML.join('');
}

function onSaveMeme() {
    saveMeme();
    document.querySelector('.saved-memes-amout').innerText++;
}

function onDeleteSavedMemes() {
    if (confirm('Are you sure you want to delete saved memes?')) {
        let savedMemes = getSavedMemes();
        savedMemes.length = 0;
        document.querySelector('.saved-memes-gallery').innerHTML = '';
        document.querySelector('.saved-memes-amout').innerText = 0;
    }
}

function onAddSticker(stickerId) {
    console.log(stickerId);
    setSticker(stickerId);
    renderMeme();
}

function onTxtInput(txt) {
    setLineTxt(txt);
    renderMeme();
}

function onChangeSize(isIncrease) {
    setTxtSize(isIncrease);
    renderMeme();
}

function onChangeAlign(value) {
    setTxtAlign(value);
    renderMeme();
}

function onChangeColor(color) {
    setTxtColor(color);
    renderMeme();
}

function onChangeStrokeColor(color) {
    setStrokeColor(color);
    renderMeme();
}

function onAddline() {
    console.log('adding line');
    setNewLine();
    renderMeme();
}

function onSwitchLine() {
    let txtLine = setSwitchLine();
    if (!txtLine) return;

}

function onChangeFont(font) {
    setNewFont(font);
    renderMeme();
}

function onChangeTxtPos(isDown) {
    setNewPos(isDown);
    renderMeme();
}

function onDeleteLine() {
    deleteLine();
    renderMeme();
}

function onDownloadCanvas(elLink) {
    const data = gElCanvas.toDataURL();
    elLink.href = data;
    elLink.download = 'Sprint2-AmitAkuka.jpg';
}
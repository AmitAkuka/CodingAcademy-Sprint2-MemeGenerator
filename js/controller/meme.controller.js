'use strict';

console.log('Meme controller Working!');

let gElCanvas = document.querySelector('#canvas');
let gCtx = gElCanvas.getContext('2d');

function renderMeme() {
    const { selectedImgId, selectedLineIdx, isClearSelectedLine, lines } = getgMeme();
    let img = new Image();
    img.src = `images/${selectedImgId}.jpg`
    img.onload = () => {
        //Draw Image
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
        lines.forEach((line, idx) => {
            if (!line.isSticker) {
                gCtx.font = `${line.size}px ${line.fontFamily}`;
                gCtx.textAlign = line.align;
                gCtx.fillStyle = line.color;
                gCtx.strokeStyle = line.strokeColor;
                //if no position add position.
                if (!line.pos) {
                    let x = gElCanvas.width / 2;
                    let y;
                    if (idx === 0) {
                        //first line at the top
                        y = 50;
                    } else if (idx === 1) {
                        //second line at the bottom.
                        y = gElCanvas.height - 25;
                    } else {
                        //third line at the middle.
                        y = gElCanvas.height / 2;
                    }
                    line.pos = { x: x, y: y };
                }
                //text width = fullwidth - 20.
                gCtx.fillText(line.txt, line.pos.x, line.pos.y, gElCanvas.width - 20);
                gCtx.strokeText(line.txt, line.pos.x, line.pos.y, gElCanvas.width - 20);
            } else {
                let stickerImg = new Image();
                stickerImg.src = `images/stickers/${line.stickerId}.png`;
                if (!line.pos) {
                    let y = 120 - line.size;
                    let x = gElCanvas.width - 100;
                    //Image size calculated from top, unliked text that calculated from bottom.
                    //in order to fix issues we use y - line.size!.
                    line.pos = { x: x, y: y };
                }
                gCtx.drawImage(stickerImg, line.pos.x, line.pos.y - line.size, line.size, line.size);
            }
            //Mark selected Line
            if (idx === selectedLineIdx && !isClearSelectedLine) {
                markSelectedLine(line);
            }
        })
    };
}

function markSelectedLine(line = gGrabbedLine()) {
    let metrics = gCtx.measureText(line.txt);
    let txtWidth = metrics.width;
    let txtHeight = gCtx.measureText('M').width;
    //old x calc for non sticker start pos: (line.pos.x - line.size * 4.5);
    //default linewidth of stroke is 1.
    gCtx.strokeStyle = 'red';
    //0 means center.
    let lineAlignPos = 0;
    if (line.align === 'left' && !line.isSticker) lineAlignPos = txtWidth / 2;
    else if (line.align === 'right' && !line.isSticker) lineAlignPos = -txtWidth / 2;
    (line.isSticker) ? gCtx.strokeRect(line.pos.x, line.pos.y - line.size, line.size, txtHeight + line.size - 20):
        gCtx.strokeRect(line.pos.x - (txtWidth / 2) + lineAlignPos - 8, line.pos.y - line.size, txtWidth + (line.size / 2) + 4, txtHeight + (line.size / 2));
}

function onClearSelectedLine() {
    let meme = getgMeme();
    meme.isClearSelectedLine = true;
    renderMeme();
    meme.isClearSelectedLine = false;
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
    onClearSelectedLine();
    setTimeout(() => {
        saveMeme();
        document.querySelector('.saved-memes-amout').innerText++;
    }, 250)
}

function onDeleteSavedMemes() {
    if (confirm('Are you sure you want to delete saved memes?')) {
        deleteSavedMemes();
        document.querySelector('.saved-memes-gallery').innerHTML = '';
        document.querySelector('.saved-memes-amout').innerText = 0;
    }
}

function onClickStickerBox(isLeftClick) {
    updateStickersStartIdx(isLeftClick);
    renderStickers();
}


function renderStickers() {
    let stickers = getStickers();
    let strHTML = stickers.map(sticker => {
        return `<img id="${sticker}" onclick="onAddSticker(this.id)" src="images/stickers/${sticker}.png"></img>`
    });
    document.querySelector('.stickers-list').innerHTML = strHTML.join('');
}

function onAddSticker(stickerId) {
    setSticker(stickerId);
    renderMeme();
}

function onTxtInput(txt) {
    document.querySelector('.text-input').value = txt;
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
    document.querySelector('.text-input').value = '';
    setNewLine();
    renderMeme();
}

function onSwitchLine() {
    let txtLine = setSwitchLine();
    updateTxtInput();
    renderMeme();
    if (!txtLine) return;

}

function updateTxtInput() {
    let elTxtInput = document.querySelector('.text-input');
    let memes = getgMeme();
    let selectedLine = memes.lines[memes.selectedLineIdx];
    if (selectedLine.txt === 'Enter your text here...' || selectedLine.isSticker) elTxtInput.value = '';
    else elTxtInput.value = selectedLine.txt;
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

//timeouts,async and await funcs didnt work on delayed download 
//(need to wait until new canvas is rendered witout the selected line)
function onDownloadCanvas() {
    onClearSelectedLine();
    let elLink = document.querySelector('.download-link');
    setTimeout(() => {
        const data = gElCanvas.toDataURL();
        elLink.href = data;
        elLink.download = 'Sprint2-AmitAkuka.jpg';
        elLink.click();
    }, 250);
}

function onShareMeme() {
    onClearSelectedLine();
    setTimeout(() => {
        uploadImg();
    }, 250);
}
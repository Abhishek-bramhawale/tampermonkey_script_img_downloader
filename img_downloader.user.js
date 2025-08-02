// ==UserScript==
// @name         YouTube + Universal Image Downloader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds download buttons to YouTube thumbnails and images on all sites
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const isYouTube = window.location.hostname.includes("youtube.com");

    const style = document.createElement('style');
    style.textContent = `
      .ytd-download-btn, .universal-download-btn {
          position:absolute;
          bottom:6px;
          right:6px;
          background:rgba(0,0,0,0.7);
          color:#fff;
          font-size:12px;
          padding: 3px 6px;
          border-radius: 4px;
          cursor:pointer;
          z-index:9999;
      }
    `;
    document.head.appendChild(style);

    function downloadYouTubeThumbnail(videoId){
        const qualities = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault', 'default'];
        let found = false;
        for(let q of qualities){
            const url = `https://i.ytimg.com/vi/${videoId}/${q}.jpg`;
            fetch(url).then(r=>{
                if(r.ok && !found){
                    found = true;
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `thumbnail-${videoId}.jpg`;
                    a.click();
                }
            })
        }
    }

function addYouTubeButtons(){
    const thumbnails = document.querySelectorAll('img');

    thumbnails.forEach(img => {
        if(img.dataset.downloadAdded) return;

        const match = img.src.match(/\/vi\/([^\/\?]+)/);
        if(match){
            const videoId = match[1];
            const btn = document.createElement('div');
            btn.className = 'ytd-download-btn';
            btn.textContent = 'Download';

            btn.onclick = (e)=>{
                e.stopPropagation();
                e.preventDefault();
                downloadYouTubeThumbnail(videoId);
            }

            img.style.position = 'relative';
            img.parentElement.style.position = 'relative';
            img.parentElement.appendChild(btn);

            img.dataset.downloadAdded = '1';
        }
    })
}


function addGenericButtons(){
    const imgs = document.querySelectorAll('img');

    imgs.forEach(img => {
        if(img.dataset.downloadAdded) return;

        if(img.width < 100 || img.height < 50) return;  

        const btn = document.createElement('div');
        btn.className = 'universal-download-btn';
        btn.textContent = '↓';

        btn.onclick = (e)=>{
            e.stopPropagation();
            e.preventDefault();

            fetch(img.src).then(resp => resp.blob()).then(blob=>{
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'image.jpg';
                a.click();
            })
        };

        img.parentElement.style.position = 'relative';
        img.parentElement.appendChild(btn);

        img.dataset.downloadAdded = '1';
    })
}


})
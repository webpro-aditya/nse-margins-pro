<?php

Route::get('/dec', function() {
    return processNseTokenResponse('jNFEWK02Lr71wP/TVwiAQzjSzWwS9yYLViLqtB0G7DHv7pUxQTWn5JpX0r2CZvQP7Dvf9JCKGqMb3CnumMKS3EWDjnpajGlBQi4Njb+1OATMQ9iYnP/YjWfQUCAurBhBX3qJPicglKFbSifraS/e/7iYbd6MTz5iftek8Lnm3RhpFGaAjAcLvwYOPCg5xOCVdNqDGiN0cYt2eNAgc4K+KodoRgHGFeY/r7YQrzCUUaeCCcUsMrgHlz31zO2PDbgsqjRnLyS3hTJyr89Zv9bmPhp5/1hP5NP40kbr6k0A6qBs82tAN8HkiklKd+Q35GVjcNiiqCKF9F1It1tLmBgONA==');
});

Route::get('/decr', function() {
    return nseAesDecrypt('mTTIChGI4a3fyQx9SpaHqCKFZxvq9HpV75gqzICyMhRy83ejwSifuK9Q+XMGTr0Wl22YYxK2EJFPOdg+BbCw9Y45VZ5Osb6utQrKWtLhPdl8uVEj6Hzb8E8+6DKhEIBA5tDu20XULqdb8sEOtc3wfA==', 'HyyqOI7Aq4KNjenP8U92aMyZ08Z0Ikb8NZ871O1gieU=', '72JEaJAxSPxZi9kj15dPhQ==');
});
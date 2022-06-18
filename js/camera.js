(function () {

    document.addEventListener("DOMContentLoaded", function () {
        videoDevice().then(function (video) {
            video.addEventListener("click", function () {
                if (videoDevices.length > 1) changeDevice();
            });
        });
    });

    let videoTrack = null;
    let videoDevices = null;

    const videoDevice = function (deviceId) {

        let promise = new Promise(function (resolve, reject) {

            let video = document.getElementById("video");
            let container = video.parentNode;

            if ((videoTrack === null) || (videoTrack.readyState == "ended")) {

                let constraints = {
                    audio: false,
                    video: {
                        width: container.clientWidth,
                        height: container.clientHeight
                    }
                };

                if (typeof deviceId === "undefined") {
                    constraints.video.facingMode = "environment";
                } else {
                    constraints.video.deviceId = deviceId;
                }

                navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {

                    if (videoDevices === null) {

                        navigator.mediaDevices.enumerateDevices().then(function (devices) {
                            videoDevices = devices.filter(function (d) { return d.kind == "videoinput"; });
                        });

                        video.addEventListener("loadedmetadata", function () {
                            video.classList.toggle("mirror", videoTrack.getSettings().facingMode == "user");
                            video.play();
                        });
                    }

                    videoTrack = stream.getVideoTracks()[0];
                    video.srcObject = stream;

                    resolve(video);

                }).catch(function (err) {
                    console.log(err.name + ": " + err.message);
                    reject(err);
                });

            } else {
                resolve(video);
            }
        });

        return promise;
    };

    const changeDevice = function () {

        let promise = new Promise(function (resolve, reject) {

            let video = document.getElementById("video");

            if ((videoDevices === null) || (videoDevices.length < 2)) {

                reject(video);

            } else {

                let deviceId = videoTrack.getSettings().deviceId;
                let index = videoDevices.findIndex(function (d) { return d.deviceId == deviceId; }) + 1;

                if (index >= videoDevices.length) {
                    index = 0;
                }

                videoTrack.stop();

                return videoDevice(videoDevices[index].deviceId).then(function (v) {
                    resolve(v);
                });
            }
        });

        return promise;
    };

})();

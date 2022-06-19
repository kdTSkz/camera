(function () {

    document.addEventListener("DOMContentLoaded", function () {

        videoDevice();

        document.addEventListener("click", changeDevice);
    });

    let videoTrack = null;
    let videoDevices = null;
    let deviceReady = true;

    const videoDevice = function (deviceId) {

        let promise = new Promise(function (resolve, reject) {

            let video = document.getElementById("video");

            if (deviceReady) {

                if ((videoTrack === null) || (videoTrack.readyState == "ended")) {

                    deviceReady = false;

                    let container = video.parentNode;
                    let constraints = {
                        audio: false,
                        video: {
                            width: container.clientWidth,
                            height: container.clientHeight
                        }
                    };

                    if (container.clientWidth < container.clientHeight) {
                        constraints.video.width = container.clientHeight;
                        constraints.video.height = container.clientWidth;
                    }

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

                                deviceReady = true;

                                resolve(video, true);
                            });
                        }

                        videoTrack = stream.getVideoTracks()[0];
                        video.srcObject = stream;

                    }).catch(function (err) {
                        console.log(err.name + ": " + err.message);
                        reject(err);
                    });

                } else {
                    resolve(video, true);
                }

            } else {
                resolve(video, false);
            }
        });

        return promise;
    };

    const changeDevice = function () {

        let promise = new Promise(function (resolve, reject) {

            if ((videoDevices === null) || (videoDevices.length < 2)) {

                resolve(document.getElementById("video"), false);

            } else {

                let deviceId = videoTrack.getSettings().deviceId;
                let index = videoDevices.findIndex(function (d) { return d.deviceId == deviceId; }) + 1;

                if (index >= videoDevices.length) {
                    index = 0;
                }

                videoTrack.stop();

                videoDevice(videoDevices[index].deviceId).then(function (video) {
                    resolve(video, true);
                });
            }
        });

        return promise;
    }

})();

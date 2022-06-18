(function () {

    document.addEventListener("DOMContentLoaded", function () {
        videoDevice()
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

})();

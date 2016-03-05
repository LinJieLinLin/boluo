angular.module('app').factory('upload', function ($q) {
    return function (option) {
        var defaultOption = {
            url: '',
            formData: {

            },
            key: ''
        };
        var input = angular.element('<input type="file">');
        var defer = $q.defer();
        var o = angular.extend(defaultOption, option);
        input.on('change', function () {
            var file = this.files[0];
            var formData = new FormData();
            if (typeof o.onchange === 'function') {o.onchange();}
            angular.forEach(o.formData, function (value, key) {
                formData.append(key, value);
            });
            formData.append(o.key, file);
            var xhr = new XMLHttpRequest();
            xhr.addEventListener('load', function () {
                try {
                    var response = JSON.parse(xhr.response);
                    defer.resolve(response);
                } catch (e) {defer.resolve(response);}
            });
            xhr.addEventListener('error', function (e) {
                defer.reject(e);
            });
            xhr.open('POST', option.url);
            xhr.send(formData);
        });

        return function () {
            input.click();
            return defer.promise;
        };
    };
});
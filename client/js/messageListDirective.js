module.exports = MessageListDirective;

MessageListDirective.$inject = ['queueSocket'];
function MessageListDirective (queueSocket) {

    return {
        restrict: 'E',
        scope: {
            queueName: '=queue',
            count: '=count'
        },
        link: function(scope) {
            scope.messages = [];
            scope.allMessages = [];
            scope.trim = trim;
            scope.count = 0;
            scope.pageNumber = 0;
            scope.pageSize = 20;

            scope.previousPage = function () {
                loadPage(scope.pageNumber - 1);
            };

            scope.nextPage = function () {
                loadPage(scope.pageNumber + 1);
            };

            queueSocket.on('message.' + scope.queueName, function (message) {
                try {
                    message.Body = JSON.parse(message.Body);
                } catch (ignore) {}

                scope.allMessages.push(message);

                if (scope.count < scope.pageSize) {
                    scope.messages.push(message);
                }

                setCount();
            });

            queueSocket.on('purge.' + scope.queueName, function () {
                scope.messages = [];
                setCount();
            });

            function trim (body) {
                return JSON.parse(body[0] === '"' ? body.slice(1, - 1) : body);
            }

            function setCount () {
                scope.count = scope.allMessages.length;
            }

            function loadPage(pageNumber) {
                if (pageNumber < 0 || pageNumber > pageCount()) {
                    return;
                }

                scope.pageNumber = pageNumber;
                scope.messages = getPage(pageNumber);
            }

            function pageCount() {
                return Math.ceil(scope.allMessages.length / scope.pageSize);
            }

            function getPage(pageNumber) {
                var offset = pageNumber * scope.pageSize;
                return scope.allMessages.slice(offset, offset + scope.pageSize);
            }
        },
        templateUrl: '/partials/messageList.html'
    };
}

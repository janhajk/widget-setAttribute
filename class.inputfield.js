class classInputField {
      constructor(type, parentDom, params, angular) {
            this.type = type;
            this.parentDom = parentDom;
            this.params = params;
            this.title = this.params.title;
            this.label = [];
            this.input = [];
            this.container;
            this.containerBody;
            this.counter = 1;
            this.summary;
            this.angularself = angular;
      }

      render = function() {
            this.container = document.createElement('div');
            this.containerBody = document.createElement('div');
            this.container.appendChild(this.containerBody);
            this.addInputField();
            this.parentDom.appendChild(this.container);

            // multi value input field
            if (this.params.multi) {
                  let add = document.createElement('button');
                  add.className = 'btn btn-secondary tb-cstm-button-add';
                  add.innerHTML = SVG_PLUS + '&nbsp;&nbsp;Add';
                  this.container.appendChild(add);
                  add.onclick = () => {
                        this.counter++;
                        console.log(this);
                        this.addInputField();
                        this.updateSummary();
                  };
                  if (this.params.multitype && this.params.multitype === 'array') {
                        let container = document.createElement('div');
                        container.style.display = 'none';
                        let label = document.createElement('label');
                        label.innerHTML = this.params.title.replace('%s', this.params.value || 0);
                        this.summary = document.createElement('input');
                        label.style.marginRight = '20px';
                        this.summary.name = this.params.key || 'thisFieldhasNoKeyPleaseSetAKey';
                        this.summary.type = 'text';
                        this.summary.className = 'form-text';
                        this.summary.value = this.params.default || '';
                        this.summary.setAttribute('disabled', 'disabled');
                        container.appendChild(label);
                        container.appendChild(this.summary);
                        this.container.appendChild(container);
                        this.updateSummary();
                  }
            }
            // ************   end multi value input field
      }
      // if there is a total field
      updateSummary = function() {
            let value = '';
            if (this.summary && this.params.multitype && this.params.multitype === 'array') {
                  let values = [];
                  this.input.forEach((item) => {
                        values.push($(item).val());
                  });
                  if (this.params.pattern) {
                        let hasError = false;
                        values.forEach((item, i) => { if (!this.checkPattern(this.input[i], item)) hasError = true; });
                        if (hasError) this.disableSendButton();
                        else this.enableSendButton();
                  }
                  value = [
                        '[',
                        values.join(','),
                        ']'
                  ].join('');
                  $(this.summary).val(value);
            }
            else {
                  let values = [$(this.input[0]).val()];
                  if (this.params.pattern) {
                        let hasError = false;
                        values.forEach((item, i) => { if (!this.checkPattern(this.input[i], item)) hasError = true; });
                        if (hasError) this.disableSendButton();
                        else this.enableSendButton();
                  }
            }
            // console.log('value:', value);
      }

      disableSendButton = function() {
            $(this.angularself.ctx.$scope.btnSend).off('click');
            $(this.angularself.ctx.$scope.btnSend).removeClass('btn-primary');
            $(this.angularself.ctx.$scope.btnSend).addClass('btn-danger');
      }

      enableSendButton = function() {
            $(this.angularself.ctx.$scope.btnSend).off('click');
            $(this.angularself.ctx.$scope.btnSend).removeClass('btn-danger');
            $(this.angularself.ctx.$scope.btnSend).addClass('btn-primary');
            $(this.angularself.ctx.$scope.btnSend).click(this.angularself.ctx.$scope.sendUpdate);
      }

      // add new input field which will be added to container
      addInputField = function() {
            let myself = this;

            let container = this.containerBody;

            // subcontainer for multi forms
            if (this.params.multi) {
                  container = document.createElement('div');
                  this.containerBody.appendChild(container);
            }

            this.label.push(document.createElement('label'));
            this.input.push(document.createElement('input'));

            const curLabel = this.label[this.label.length - 1];
            const curInput = this.input[this.input.length - 1];


            curLabel.className = 'form-label';
            curLabel.innerHTML = this.params.title.replace('%s', this.params.value || 0);

            curLabel.for = 'cstmFrmInput-' + this.params.key;

            curInput.name = this.params.key || ['thisFieldhasNoKeyPleaseSetAKey', i].join('-');

            curInput.id = 'cstmFrmInput-' + this.params.key;

            if (this.params.multi) {
                  curLabel.innerHTML = this.params.title.replace('%s', this.params.value || 0).replace(':', '') + ' ' + this.counter + ':';
                  curInput.name = curInput.name + '-' + this.input.length;
            }

            switch (this.type) {
                  case 'range':
                        curInput.type = 'range';
                        curInput.className = 'form-range';
                        curInput.min = this.params.min || 0;
                        curInput.max = this.params.max || 100;
                        curInput.step = this.params.step || 0.1;
                        curInput.value = this.params.value || 0;
                        curInput.oninput = () => $(myself.label[0]).html(myself.params.title.replace('%s', $(myself.input[0]).val()));
                        container.appendChild(curLabel);
                        container.appendChild(curInput);
                        break;
                  case 'text':
                        curLabel.style.marginRight = '20px';
                        curInput.type = 'text';
                        curInput.className = 'form-text';
                        curInput.value = this.params.default || '';
                        container.appendChild(curLabel);
                        container.appendChild(curInput);
                        curInput.oninput = () => this.updateSummary();
                        curInput.onblur = () => this.updateSummary();
                        break;
                  case 'checkbox':
                        container.className = 'form-check';
                        curInput.type = 'checkbox';
                        curInput.value = '';
                        curInput.className = 'form-check-input';
                        curInput.className = 'form-check-label';
                        container.appendChild(curInput);
                        container.appendChild(curLabel);
                        break;
            }
            if (this.params.multi) {
                  curInput.setAttribute('partValue', 'yes');
            }

            // set default value from last setting
            this.getDefaultValue(this.params.key)
                  .then(attribute => {
                        curInput.value = attribute[0].value;
                        $(myself.label[0]).html(myself.params.title.replace('%s', $(myself.input[0]).val()));

                  });
      }
      checkPattern = function(input, value) {
            let correct = false;
            if (!this.params.pattern) correct = true;
            let reg = new RegExp(this.params.pattern);
            if (reg.test(value)) correct = true;
            if (!correct) this.shake(input);
            return correct;
      }
      shake = function(domElement) {
            domElement.classList.add('shake');
            setTimeout(function() {
                  domElement.classList.remove('shake');
            }, 200);
      }

      // get default value from server attribute (which is last set value)
      // returns promise
      getDefaultValue = function(attributeKey) {
            let entityAttributeType = this.angularself.ctx.settings.entityAttributeType;
            let attributeService = this.angularself.ctx.$scope.$injector.get(this.angularself.ctx.servicesMap.get('attributeService'));
            const entityId = {
                  entityType: 'DEVICE',
                  id: this.angularself.ctx.defaultSubscription.targetDeviceId
            };
            return new Promise((resolve, reject) => {
                  attributeService.getEntityAttributes(entityId,
                        entityAttributeType, [attributeKey]).subscribe(
                        function success(data) {
                              console.log(data);
                              resolve(data);
                        },
                        function fail(rejection) {
                              reject(rejection);
                        }
                  );
            });
      }

}

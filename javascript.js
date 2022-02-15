/*
      global self, $
*/



// SVG Plus icon
const SVG_PLUS = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>';



self.onInit = function() {
      self.ctx.ngZone.run(function() {
            init();
            self.ctx.detectChanges();
      });
};

function init() {

      const cstmFields = JSON.parse(self.ctx.settings.entityParameters);

      self.ctx.$scope.command = self.ctx.settings.command;

      $(document).ready(function() {
            const frm = document.getElementById('cstmFrm1-' + self.ctx.settings.command);
            for (let i = 0; i < cstmFields.length; i++) {
                  const field = cstmFields[i];
                  let input = new classInputField(field.type, frm, field, self);
                  input.render();
            }

            frm.appendChild(document.createElement('br'));

            // send button
            let button = document.createElement('button');
            button.className = 'btn btn-primary';
            button.innerHTML = self.ctx.settings.buttonText;
            $(button).click(self.ctx.$scope.sendUpdate);
            frm.appendChild(button);
            self.ctx.$scope.btnSend = button;

      });


      self.ctx.$scope.showTitle = self.ctx.settings.title &&
            self.ctx.settings.title.length ? true : false;
      self.ctx.$scope.title = self.ctx.settings.title;
      self.ctx.$scope.styleButton = self.ctx.settings.styleButton;
      let entityAttributeType = self.ctx.settings.entityAttributeType;

      if (self.ctx.settings.styleButton.isPrimary ===
            false) {
            self.ctx.$scope.customStyle = {
                  'background-color': self.ctx.$scope.styleButton
                        .bgColor,
                  'color': self.ctx.$scope.styleButton.textColor
            };
      }

      let attributeService = self.ctx.$scope.$injector.get(self.ctx.servicesMap.get('attributeService'));

      self.ctx.$scope.sendUpdate = function() {

            let attributes = [];

            // take command from widget Settings
            attributes.push({
                  key: 'command',
                  value: self.ctx.settings.command
            });

            // loop input forms and get values
            $('#cstmFrm1-' + self.ctx.settings.command + ' *').filter(":input").not("[partValue='yes']").each(function() {
                  if ($(this).attr('name')) {
                        var value = ($(this).attr('type') === 'checkbox') ? ($(this).prop('checked') ? true : false) : $(this).val();
                        attributes.push({
                              key: $(this).attr('name'),
                              value: value
                        });
                  }
            });


            let entityId = {
                  entityType: "DEVICE",
                  id: self.ctx.defaultSubscription.targetDeviceId
            };
            attributeService.saveEntityAttributes(entityId,
                  entityAttributeType, attributes).subscribe(
                  function success() {
                        self.ctx.$scope.error = "";
                        self.ctx.detectChanges();
                  },
                  function fail(rejection) {
                        if (self.ctx.settings.showError) {
                              self.ctx.$scope.error =
                                    rejection.status + ": " +
                                    rejection.statusText;
                              self.ctx.detectChanges();
                        }
                  }

            );
      };
}

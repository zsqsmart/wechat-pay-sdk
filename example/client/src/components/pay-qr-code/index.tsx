import { NModal, NQrCode, useMessage } from 'naive-ui';
import { reqOrderStatus } from 'src/apis/order';
import {
  defineComponent,
  type ExtractPropTypes,
  onBeforeUnmount,
  watch,
  type PropType,
} from 'vue';

const props = {
  codeUrl: String,
  orderId: {
    type: String,
    required: true,
  },
  onSuccess: Function,
  onFailed: Function,
  show: Boolean,
  'onUpdate:show': Function as PropType<(show: boolean) => void>,
  onHide: Function,
  onUpdateShow: Function,
} as const;

export type Props = ExtractPropTypes<typeof props>;

const PayQrCode = defineComponent({
  props,
  setup(props) {
    let timer = null;
    let loopCount = 0;
    const message = useMessage();

    const updateShow = (show: boolean) => {
      props['onUpdate:show']?.(show);
      if (!show) props.onHide?.();
    };

    watch(
      () => props.show,
      (val) => {
        if (val) {
          loopQueryStatus();
        } else {
          timer && clearTimeout(timer);
        }
      },
    );

    onBeforeUnmount(() => {
      timer && clearTimeout(timer);
    });

    const loopQueryStatus = () => {
      timer && clearTimeout(timer);
      if (loopCount > 30) {
        loopCount = 0;
        return;
      }
      loopCount++;
      timer = setTimeout(async () => {
        const { status } = await reqOrderStatus(props.orderId);
        if (status === 'SUCCESS') {
          updateShow(false);
          message.success('支付成功!');
          props.onSuccess();
          return;
        }
        loopQueryStatus();
      }, 1000);
    };

    return () => (
      <NModal
        show={props.show}
        onUpdateShow={updateShow}
        mask-closable={false}
        preset="dialog"
        title="微信扫码支付"
        content={() => (
          <div class="flex justify-center">
            <NQrCode value={props.codeUrl} color="#18a058" size={300} />
          </div>
        )}
      />
    );
  },
});

export default PayQrCode;

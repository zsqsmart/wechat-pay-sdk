import { useRequest } from 'alova';
import { defineComponent, ref } from 'vue';
import { map } from 'lodash-es';
import { NButton, NCard, NSpin } from 'naive-ui';
import { reqProducts } from 'src/apis/product';
import { reqCreateOrder } from 'src/apis/order';
import PayQrCode from 'src/components/pay-qr-code';
import { useRouter } from 'vue-router';

const ProductPage = defineComponent({
  setup() {
    const qrCodeModalOpen = ref(false);

    const router = useRouter();

    const { data, loading } = useRequest(reqProducts, {
      initialData: [],
    });

    const orderRequest = useRequest(reqCreateOrder, {
      immediate: false,
      initialData: {},
    });

    orderRequest.onSuccess(() => {
      qrCodeModalOpen.value = true;
    });

    return () => {
      return (
        <NSpin show={loading.value}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
            }}
          >
            {map(data.value, (product) => (
              <NCard
                class="w-3/10"
                key={product.id}
                title={product.name}
                v-slots={{
                  cover: () => <img alt={product.name} src={product.cover} />,
                }}
              >
                <div class="flex items-center justify-between">
                  <span class="text-pink-600">
                    ¥{(product.price / 100).toFixed(2)}
                  </span>
                  <NButton
                    loading={orderRequest.loading.value}
                    type="primary"
                    size="small"
                    onClick={() => {
                      orderRequest.send({
                        product: product.id,
                        amount: product.price,
                      });
                    }}
                  >
                    购买
                  </NButton>
                </div>
              </NCard>
            ))}
          </div>
          <PayQrCode
            v-model:show={qrCodeModalOpen.value}
            orderId={orderRequest.data.value.id}
            codeUrl={orderRequest.data.value.codeUrl}
            onSuccess={() => {
              router.push('/order');
            }}
          />
        </NSpin>
      );
    };
  },
});

export default ProductPage;

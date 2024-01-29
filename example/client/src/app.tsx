import { NMenu, NMessageProvider } from 'naive-ui';
import type { MenuOption } from 'naive-ui';
import { defineComponent } from 'vue';

import { RouterLink, RouterView, useRoute } from 'vue-router';

const App = defineComponent({
  setup() {
    const menuOptions: MenuOption[] = [
      {
        label: () => <RouterLink to="/product">商品</RouterLink>,
        key: '/product',
      },
      {
        label: () => <RouterLink to="/order">订单</RouterLink>,
        key: '/order',
      },
    ];
    const route = useRoute();
    return () => (
      <NMessageProvider>
        <NMenu mode="horizontal" options={menuOptions} value={route.path} />
        <RouterView />
      </NMessageProvider>
    );
  },
});

export default App;

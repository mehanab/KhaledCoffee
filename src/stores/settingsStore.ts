import { defineStore } from 'pinia'
import { supabase } from '../utils/supabase'
import { computed } from 'vue'

export const useSettingsStore = defineStore('settings', {
    state: () => ({ 
        settings: [] as { key: string; value: any }[],
    }),
    getters: {
        appName: (state) =>
            state.settings?.find(s => s.key === 'appname')?.value ?? null,
        currency: (state) =>
            state.settings?.find(s => s.key === 'devise')?.value ?? null,
    },
    actions: {
        async fetchSettings() {
            const { data, error } = await supabase.from('settings').select('*');
            if (error) throw error;
            this.settings = data;
        }, 
        async fetchSettingByKey(key: string) {
            const { data, error } = await supabase.from('settings').select('*').eq('key', key);
            if (error) throw error;
            this.settings = data;
        },
        async updateSettingByKey(key: string, value: any) {
            const { data, error } = await supabase.from('settings').update({ value }).select('*').eq('key', key).single();
            if (error) throw error;
            this.settings = this.settings.map(s => s.key === key ? data : s);
        },

        async subscribeToSettings() {
            const subscription =  supabase
                .channel('settings-changes')
                .on(
                    'postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'settings' 
                    },
                    payload => {
                        this.fetchSettings();
                    }
                )
                .subscribe();
            return subscription;
        }
    }
})
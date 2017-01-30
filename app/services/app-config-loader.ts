import { IAjaxService } from './infrastructure/ajax-service';
import { AppConfig } from 'app/model/config/app-config';
import { RandomHelper } from 'app/utils/random-helper';

export interface IAppConfigLoader {
    lazyLoadConfigChunk(name: string): Promise<string>
}

export class AppConfigLoader implements IAppConfigLoader {
    private cache = new Map<string, string>();

    constructor(private ajaxService: IAjaxService) {
    }

    async loadData(): Promise<AppConfig> {
        const configData = await this.ajaxService.ajax(`config.json?${RandomHelper.getRandomObjectId(20)}`, 'get');
        const config = AppConfig.buildFromConfigData(configData);
        return config;
    }

    async lazyLoadConfigChunk(name: string): Promise<string> {
        if (this.cache.has(name)) {
            return this.cache.get(name);
        } else {
            const res = await this.ajaxService.ajax<string>(`${name.substring(4)}?${RandomHelper.getRandomObjectId(20)}`, 'get', undefined, true);
            this.cache.set(name, res);
            return res;
        }
    }
}
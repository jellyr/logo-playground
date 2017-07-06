import { stay } from "app/utils/async-helpers";

import { RandomHelper } from 'app/utils/random-helper';
import { ICurrentUserService } from "app/services/login/current-user.service";
import { ProgramModel } from "app/services/gallery/program.model";
import { injectable, inject } from "app/di";

export type ProgramStorageType = "library" | "samples" | "gist";

export interface IProgramsRepository {
    getAll(): Promise<ProgramModel[]>
    get(id: string): Promise<ProgramModel>
    add(program: ProgramModel): Promise<ProgramModel>
    update(program: ProgramModel): Promise<void>
    remove(id: string): Promise<void>
}

@injectable()
export class ProgramsLocalStorageRepository implements IProgramsRepository {
    storage: Storage = window.localStorage;
    constructor(
        @inject(ICurrentUserService) private currentUser: ICurrentUserService
    ) {
    }

    async getAll(): Promise<ProgramModel[]> {
        //await stay(2000);
        let programs: ProgramModel[] = [];
        for (let keyIndex = 0; keyIndex < this.storage.length; ++keyIndex) {
            const key = this.storage.key(keyIndex);
            if (key !== null && key.startsWith(this.getStorageKeyPrefix())) {
                let program = this.getProgramFromStorage(key);
                if (program) {
                    programs.push(program);
                }
            }
        }
        programs = programs.sort((p1, p2) => { return p1.dateLastEdited > p2.dateLastEdited ? -1 : 1 });
        return programs;
    }

    async get(id: string): Promise<ProgramModel> {
        let program = this.getProgramFromStorage(this.getStorageKey(id));
        if (program) {
            return program;
        }
        throw new Error(`Program with id ${id} is not found`);
    }

    async add(program: ProgramModel): Promise<ProgramModel> {
        if (!program.id) {
            program.id = RandomHelper.getRandomObjectId(32);
        }
        if (program.dateCreated.getTime() === 0) {
            program.dateCreated = new Date();
            program.dateLastEdited = new Date();
        }
        this.storage.setItem(this.getStorageKey(program.id), program.toJson());
        return program;
    }

    async update(program: ProgramModel): Promise<void> {
        program.dateLastEdited = new Date();
        this.storage.setItem(this.getStorageKey(program.id), program.toJson());
    }

    async remove(id: string): Promise<void> {
        this.storage.removeItem(this.getStorageKey(id));
    }

    private getStorageKeyPrefix() {
        const loginStatus = this.currentUser.getLoginStatus();
        if (loginStatus.isLoggedIn) {
            return loginStatus.userInfo.id + ":program:";
        } else {
            return 'program_';
        }
    }

    private getStorageKey(id: string) {
        return `${this.getStorageKeyPrefix()}${id}`;
    }

    private getProgramFromStorage(storageKey: string): ProgramModel | undefined {
        const data = this.storage.getItem(storageKey);
        if (data) {
            try {
                let program = ProgramModel.fromJson(JSON.parse(data));
                return program;
            }
            catch (ex) {
                console.error('Error during parsing the program', data, ex);
            }
        }
        return undefined;
    }
}
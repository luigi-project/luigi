import { NavigationService, type Node } from '../../src/services/navigation.service';

describe('NavigationService.onNodeChange', () => {
  let luigiMock: any;
  let navigationService: NavigationService;
  let prevNode: Node;
  let nextNode: Node;

  beforeEach(() => {
    prevNode = { label: 'prev', children: [] };
    nextNode = { label: 'next', children: [] };
    luigiMock = {
      getConfigValue: jest.fn()
    };
    navigationService = new NavigationService(luigiMock);
  });

  it('should call nodeChangeHook function if it is a function', () => {
    const hook = jest.fn();
    luigiMock.getConfigValue.mockReturnValue(hook);

    navigationService.onNodeChange(prevNode, nextNode);

    expect(hook).toHaveBeenCalledWith(prevNode, nextNode);
  });

  it('should not call nodeChangeHook if it is undefined', () => {
    luigiMock.getConfigValue.mockReturnValue(undefined);
    // No error should be thrown
    expect(() => navigationService.onNodeChange(prevNode, nextNode)).not.toThrow();
  });

  it('should warn if nodeChangeHook is not a function but defined', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    luigiMock.getConfigValue.mockReturnValue('notAFunction');

    navigationService.onNodeChange(prevNode, nextNode);

    expect(warnSpy).toHaveBeenCalledWith('nodeChangeHook is not a function!');
    warnSpy.mockRestore();
  });
});

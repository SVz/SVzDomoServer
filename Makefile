all: radioEmission

radioEmission: RCSwitch.o radioEmission.o
	$(CXX) $(CXXFLAGS) $(LDFLAGS) $+ -o $@ -lwiringPi

clean:
	$(RM) *.o radioEmission
